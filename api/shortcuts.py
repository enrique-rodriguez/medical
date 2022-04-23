

def reverse(*args, **kwargs):
    """
    reverse with querystring support
    """
    from django.urls import reverse as _reverse

    query = kwargs.pop('query', None)
    url = _reverse(*args, **kwargs)
    if query:
        querystring = build_querystring(query)
        url = url + '?' + querystring
    return url


def build_querystring(elements):
    """
    Turns a dict object like: { 'a': '1', 'b': '2' } into a=1&b=2
    """

    return "&".join([f"{key}={value}" for key, value in elements.items()])